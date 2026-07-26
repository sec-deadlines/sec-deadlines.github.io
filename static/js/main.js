---
---
$(function() {
  var deadlineByConf = {};

  {% for conf in site.data.conferences %}
  // {{ conf.name }} {{ conf.year }}
  {% if conf.deadline[0] == "TBA" %}
  {% assign conf_type = conf.tags | join: "-" | slugify %}
  {% assign conf_id = conf.name | append: conf.year | append: '-0' | append: conf_type | slugify %}
  $('#{{ conf_id }} .timer').html("TBA");
  $('#{{ conf_id }} .deadline-time').html("TBA");
  deadlineByConf["{{ conf_id }}"] = null;

  {% else %}
  var rawDeadlines = {{ conf.deadline | jsonify }} || [];
  if (rawDeadlines.constructor !== Array) {
    rawDeadlines = [rawDeadlines];
  }

  var parsedDeadlines = [];
  while (rawDeadlines.length > 0) {
    var rawDeadline = rawDeadlines.pop();

    // deal with year template in deadline
    var year = {{ conf.year }};
    rawDeadline = rawDeadline.replace('%y', year).replace('%Y', year - 1);

    // adjust date according to deadline timezone
    {% if conf.timezone %}
    var deadline = moment.tz(rawDeadline, "YYYY-M-D HH:mm", "{{ conf.timezone }}");
    {% else %}
    var deadline = moment.tz(rawDeadline, "YYYY-M-D HH:mm", "Etc/GMT+12"); // Anywhere on Earth
    {% endif %}

    // post-process date
    if (deadline.minutes() === 0) {
      deadline.subtract(1, 'seconds');
    }
    if (deadline.minutes() === 59) {
      deadline.seconds(59);
    }
    parsedDeadlines.push(deadline);
  }

  parsedDeadlines.reverse();

  {% assign range_end = conf.deadline.size | minus: 1 %}
  {% for i in (0..range_end) %}
  {% assign conf_id = conf.name | append: conf.year | append: '-' | append: i | slugify %}
  var deadlineId = {{ i }};
  if (deadlineId < parsedDeadlines.length) {
    var confDeadline = parsedDeadlines[deadlineId];

    if (confDeadline) {
      function make_update_countdown_fn(confDeadline) {
        return function(event) {
          var diff = moment() - confDeadline;
          if (diff <= 0) {
            $(this).html(event.strftime('%D days %Hh %Mm %Ss'));
          } else {
            $(this).html(confDeadline.fromNow());
          }
        };
      }

      $('#{{ conf_id }} .timer').countdown(
        confDeadline.toDate(),
        make_update_countdown_fn(confDeadline)
      );

      if (moment() - confDeadline > 0) {
        $('#{{ conf_id }}').addClass('past');
      }

      $('#{{ conf_id }} .deadline-time').html(
        confDeadline.local().format('D MMM YYYY, h:mm:ss a')
      );
      deadlineByConf["{{ conf_id }}"] = confDeadline;
    }
  }
  {% endfor %}
  {% endif %}
  {% endfor %}

  // Reorder list
  var today = moment();
  var confs = $('.conf').detach();

  confs.sort(function(a, b) {
    var aDeadline = deadlineByConf[a.id];
    var bDeadline = deadlineByConf[b.id];

    var aDiff = aDeadline ? today.diff(aDeadline) : Number.POSITIVE_INFINITY;
    var bDiff = bDeadline ? today.diff(bDeadline) : Number.POSITIVE_INFINITY;

    if (aDiff < 0 && bDiff > 0) return -1;
    if (aDiff > 0 && bDiff < 0) return 1;
    return bDiff - aDiff;
  });

  $('.conf-container').append(confs);

  var domGroupKey = { filter1: 'domain', filter2: 'type', filter3: 'rank' };
  var filterGroups = {
    domain: {{ site.data.filters.filter1 | jsonify }},
    type: {{ site.data.filters.filter2 | jsonify }},
    rank: {{ site.data.filters.filter3 | jsonify }}
  };

  var all_tags = Object.keys(filterGroups)
    .reduce(function(acc, key) { return acc.concat(filterGroups[key]); }, [])
    .map(function(item) { return item.tag; });

  var nameToTag = {};
  var tagToName = {};
  Object.keys(filterGroups).forEach(function(group) {
    filterGroups[group].forEach(function(item) {
      nameToTag[item.name] = item.tag;
      tagToName[item.tag] = item.name;
    });
  });

  function addUnique(array, value) {
    if (array.indexOf(value) === -1) array.push(value);
  }

  function getQueryParamParts(name) {  // URLSearchParams but for IE9
    function decodeQueryComponent(value) {
      value = value.replace(/\+/g, ' ');
      try { return decodeURIComponent(value); }
      catch (e) { return value; }
    }

    var pairs = window.location.search.slice(1).split('&');

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      var key = pair.shift();

      if (decodeQueryComponent(key) === name) {
        return pair.join('=').split(',').map(decodeQueryComponent);
      }
    }

    return null;
  }

  function readSelectionFromUrl() {
    var found = false;
    var selected = { domain: [], type: [], rank: [] };
    Object.keys(filterGroups).forEach(function(group) {
      var names = getQueryParamParts(group);
      if (names === null) return;

      found = true;

      names.forEach(function(name) {
        var tag = nameToTag[name];
        if (tag) addUnique(selected[group], tag);
      });
    });
    return found ? selected : null;
  }

  var initialSelection = readSelectionFromUrl();
  var initialTags;
  if (initialSelection) {
    initialTags = [];
    Object.keys(initialSelection).forEach(function(group) {
      initialSelection[group].forEach(function(tag) {
        initialTags.push(tag);
      });
    });
  } else {
    initialTags = store.get('{{ site.domain }}');
    if (!Array.isArray(initialTags)) {
      initialTags = [];
    }
  }

  for (var i = 0; i < all_tags.length; i++) {
    var tag = all_tags[i];
    $('#' + tag + '-checkbox').prop('checked', initialTags.indexOf(tag) !== -1);
  }

  function getSelectedFiltersFromDOM() {
    var selected = { domain: [], type: [], rank: [] };

    $('.filter-checkbox:checked').each(function() {
      var tag = $(this).attr('id').replace('-checkbox', '');
      var filterGroup = domGroupKey[$(this).data('filter-group')];

      if (filterGroup && selected[filterGroup]) {
        addUnique(selected[filterGroup], tag);
      }
    });

    return selected;
  }

  function saveSelectedTags() {
    var selectedTags = [];
    $('.filter-checkbox:checked').each(function() {
      selectedTags.push($(this).attr('id').replace('-checkbox', ''));
    });
    store.set('{{ site.domain }}', selectedTags);
  }

  function updateUrlFromSelection() {
    var selected = getSelectedFiltersFromDOM();
    var queryParts = [];

    Object.keys(filterGroups).forEach(function(group) {
      var encodedNames = [];

      selected[group].forEach(function(tag) {
        var name = tagToName[tag];
        if (name) encodedNames.push(encodeURIComponent(name));
      });

      if (encodedNames.length > 0) {
        queryParts.push(
          encodeURIComponent(group) + '=' + encodedNames.join(',')
        );
      }
    });

    var query = queryParts.join('&');
    var newUrl =
      window.location.pathname +
      (query ? '?' + query : '') +
      window.location.hash;

    if (window.history && window.history.replaceState) {  // IE9 won't support
      window.history.replaceState(null, '', newUrl);
    }
  }

  function updateConfList() {
    var selectedFilters = getSelectedFiltersFromDOM();

    $('.conf').each(function() {
      var conf = $(this);
      var show = true;

      Object.keys(selectedFilters).forEach(function(filterGroup) {
        if (!show) return;

        if (selectedFilters[filterGroup].length > 0) {
          var hasTag = false;

          selectedFilters[filterGroup].forEach(function(tag) {
            if (conf.hasClass(tag)) {
              hasTag = true;
            }
          });

          if (!hasTag) {
            show = false;
          }
        }
      });

      conf.toggle(show);
    });
  }

  $('.filter-checkbox').on('change', function() {
    saveSelectedTags();
    updateConfList();
    updateUrlFromSelection();
  });

  // Apply the initial selection, persist it to the store so it survives a
  // bare-URL revisit, and sync the URL to reflect the current filters.
  if (initialSelection) saveSelectedTags();
  updateConfList();
  updateUrlFromSelection();
});

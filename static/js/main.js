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

  // Read filter data from Jekyll
  var filter1 = {{ site.data.filters.filter1 | jsonify }};
  var filter2 = {{ site.data.filters.filter2 | jsonify }};
  var filter3 = {{ site.data.filters.filter3 | jsonify }};

  var all_tags = [];

  function processFilters(filters) {
    for (var i = 0; i < filters.length; i++) {
      all_tags.push(filters[i].tag);
    }
  }

  processFilters(filter1);
  processFilters(filter2);
  processFilters(filter3);

  // Restore saved checkbox state
  var tags = store.get('{{ site.domain }}');
  if (!Array.isArray(tags)) {
    tags = [];
  }

  for (var i = 0; i < all_tags.length; i++) {
    var tag = all_tags[i];
    $('#' + tag + '-checkbox').prop('checked', tags.includes(tag));
  }

  function getSelectedFiltersFromDOM() {
    var selected = {
      filter1: new Set(),
      filter2: new Set(),
      filter3: new Set()
    };

    $('.filter-checkbox:checked').each(function() {
      var tag = $(this).attr('id').replace('-checkbox', '');
      var filterGroup = $(this).data('filter-group');

      if (filterGroup && selected[filterGroup]) {
        selected[filterGroup].add(tag);
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

  function updateConfList() {
    var selectedFilters = getSelectedFiltersFromDOM();

    $('.conf').each(function() {
      var conf = $(this);
      var show = true;

      Object.keys(selectedFilters).forEach(function(filterGroup) {
        if (!show) return;

        if (selectedFilters[filterGroup].size > 0) {
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
  });

  updateConfList();
});

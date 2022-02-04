---
---
$(function() {
  deadlineByConf = {};

  {% for conf in site.data.conferences %}
  // {{ conf.name }} {{ conf.year }}
  {% if conf.deadline[0] == "TBA" %}
  {% assign conf_id = conf.name | append: conf.year | append: '-0' | slugify %}
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
    year = {{ conf.year }};
    rawDeadline = rawDeadline.replace('%y', year).replace('%Y', year - 1);
    // adjust date according to deadline timezone
    {% if conf.timezone %}
    var deadline = moment.tz(rawDeadline, "{{ conf.timezone }}");
    {% else %}
    var deadline = moment.tz(rawDeadline, "Etc/GMT+12"); // Anywhere on Earth
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
  // due to pop before; we need to reverse such that the i index later matches
  // the right parsed deadline
  parsedDeadlines.reverse();

  {% assign range_end = conf.deadline.size | minus: 1 %}
  {% for i in (0..range_end) %}
  {% assign conf_id = conf.name | append: conf.year | append: '-' | append: i | slugify %}
  var deadlineId = {{ i }};
  if (deadlineId < parsedDeadlines.length) {
    var confDeadline = parsedDeadlines[deadlineId];

    // render countdown timer
    if (confDeadline) {
      function make_update_countdown_fn(confDeadline) {
        return function(event) {
          diff = moment() - confDeadline
          if (diff <= 0) {
             $(this).html(event.strftime('%D days %Hh %Mm %Ss'));
          } else {
            $(this).html(confDeadline.fromNow());
          }
        }
      }
      $('#{{ conf_id }} .timer').countdown(confDeadline.toDate(), make_update_countdown_fn(confDeadline));
      // check if date has passed, add 'past' class to it
      if (moment() - confDeadline > 0) {
        $('#{{ conf_id }}').addClass('past');
      }
      $('#{{ conf_id }} .deadline-time').html(confDeadline.local().format('D MMM YYYY, h:mm:ss a'));
      deadlineByConf["{{ conf_id }}"] = confDeadline;
    }
  } else {
    // TODO: hide the conf_id ?
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
    var aDiff = today.diff(aDeadline);
    var bDiff = today.diff(bDeadline);
    if (aDiff < 0 && bDiff > 0) {
      return -1;
    }
    if (aDiff > 0 && bDiff < 0) {
      return 1;
    }
    return bDiff - aDiff;
  });
  $('.conf-container').append(confs);

  // Set checkboxes
  var conf_type_data = {{ site.data.types | jsonify }};
  var all_tags = [];
  var toggle_status = {};
  for (var i = 0; i < conf_type_data.length; i++) {
    all_tags[i] = conf_type_data[i]['tag'];
    toggle_status[all_tags[i]] = false;
  }
  var tags = store.get('{{ site.domain }}');
  if (tags === undefined) {
    tags = all_tags;
  }
  for (var i = 0; i < tags.length; i++) {
    $('#' + tags[i] + '-checkbox').prop('checked', true);
    toggle_status[tags[i]] = true;
  }
  store.set('{{ site.domain }}', tags);

  function update_conf_list() {
    confs.each(function(i, conf) {
      var conf = $(conf);
      var show = false;
      for (var i = 0; i < all_tags.length; i++) {
        if(conf.hasClass(all_tags[i])) {
          show = show | toggle_status[all_tags[i]];
        }
      }
      if (show) {
        conf.show();
      } else {
        conf.hide()
      }
    });
  }
  update_conf_list();

  // Event handler on checkbox change
  $('form :checkbox').change(function(e) {
    var checked = $(this).is(':checked');
    var tag = $(this).prop('id').slice(0, -9);
    toggle_status[tag] = checked;

    if (checked == true) {
      if (tags.indexOf(tag) < 0)
        tags.push(tag);
    }
    else {
      var idx = tags.indexOf(tag);
      if (idx >= 0)
        tags.splice(idx, 1);
    }
    store.set('{{ site.domain }}', tags);
    update_conf_list();
  });
});

# Security and Privacy deadlines countdown

Based on [ai-deadlines](https://aideadlin.es) by @abshkdz

## Is my entry in scope?

This page is meant to host academic conference or workshop deadlines.  

To check if an entry is a good fit for this page, in general, I would check for the following:
* Is there a "Call For Papers"? Is there a link for submissions? Are there formatting guidelines (page limits, style guide) etc?
* Is security, privacy, or cryptography mentioned in the list of topics?
* Is there a review process? Does the website name a general chair, program chair, or program committee?
* If accepted, will the paper be published in a proceedings?

If "Yes" to all of the above, then the conference or workshop is likely a good fit.
Examples where conferences were **not** a good fit are [FTC's PrivacyCon](https://www.ftc.gov/news-events/events/2024/03/privacycon-2024)
(see [sec-deadlines/#246](https://github.com/sec-deadlines/sec-deadlines.github.io/pull/246)) and
[Real World Crypto (RWC)](https://rwc.iacr.org/2026/) (see [sec-deadlines/#475](https://github.com/sec-deadlines/sec-deadlines.github.io/issues/475)).
Once PrivacyCon or RWC begin publishing proceedings, they'd become fit for inclusion.

## Adding/updating a conference

* Read the data format description below. **Note that the timezone format sign is inverted** (e.g., UTC+7 is written as `Etc/GMT-7`). It's [not a bug][0]. I hate this format too. I'd be happy to move to a different timezone JavaScript library that uses a friendlier format, but I don't have time for that.
* Update `_data/conferences.yml`. You can do that on GitHub or locally after forking the repo.
* Please check if an entry for a prior year's offering exists; if so, please update the prior entry, rather than adding a new one. 
* Send a pull request

### Conference entry record

Example record:

```yaml
- name: Euro S&P
  description: IEEE European Symposium on Security and Privacy
  year: 2018
  link: http://www.ieee-security.org/TC/EuroSP2018/
  dblp: https://dblp.org/db/conf/eurosp/index.html
  deadline: ["2017-08-15 23:59"]  # must be a list
  date: April 24-26
  place: London, UK
  tags: [SEC, PRIV]
```

Descriptions of the fields:

| Field name    | Description                                                                             |
|---------------|-----------------------------------------------------------------------------------------|
| `name`\*      | Short conference name, without year                                                     |
| `year`\*      | Year the conference is happening                                                        |
| `description` | Description, or long name                                                               |
| `comment`     | Additional comments, e.g., co-located conference, rolling deadline                      |
| `link`\*      | URL to the conference home page                                                         |
| `dblp`        | URL to the [DBLP](https://dblp.org) page of the conference                              |
| `deadline`\*  | A list of deadlines. [(Gory details below)][4]                                          |
| `timezone`    | [Timezone][5] in [tz][1] format. By default is UTC-12 ([AoE][2])                        |
| `date`        | When the conference is happening                                                        |
| `place`       | Where the conference is happening                                                       |
| `tags`        | One or multiple [tags][3]: `SEC`, `PRIV`, or `CRYPTO` (topic); `CONF` or `SHOP` (venue) |

Fields marked with asterisk (\*) are required.


### Deadline format

The *deadline* field can contain:

1. The simplest option: a date and time in ISO format. Example: `["2017-08-19 23:59"]` (Note that you need to wrap even a single deadline in a list).
2. If a deadline is rolling, you can use a template date, just substitute the
   year with `%y` and the year before the conference with `%Y`. Example:
   `["%y-01-15 23:59"]` means there is a deadline on the 15th January in the
   same year as the conference.
2. A list of (1) or (2). Example of two rolling deadlines, with one in the end
   of October in the year prior to the conference year, and the second in the
   end of February in the same year as the conference:
  ```
  - "%Y-10-31 23:59"
  - "%y-02-28 23:59"
  ```

On the page, all deadlines are displayed in viewer's local time (that's a feature).

*Note:* If the deadline hour is `{h}:00`, it will be automatically translated into `{h-1}:59:59` to avoid pain and confusion when it happens to be midnight in local time.

### Timezones

The timezone is specified in [tz format][1]. Unlike abbreviations (e.g. EST), these are un-ambiguous. Here are tz codes for some common timezones:

| Common name                   | tz                                                                 |
|-------------------------------|--------------------------------------------------------------------|
| UTC                           | `Etc/UTC`                                                          |
| America Pacific Time          | `America/Los_Angeles`                                              |
| Pacific Standard Time (UTC-8) | `Etc/GMT+8` (Yes, the sign is inverted for some weird reason)      |
| America Eastern Time          | `America/New_York`                                                 |
| Eastern Standard Time (UTC-5) | `Etc/GMT+5`                                                        |
| American Samoa Time (UTC-11)  | `Pacific/Samoa` or `Etc/GMT+11`. This timezone does not use DST.   |
| Aleutian Islands              | `America/Adak`                                                     |

[0]: https://momentjs.com/timezone/docs/#/zone-object/offset/
[1]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[2]: https://www.timeanddate.com/time/zones/aoe
[3]: _data/types.yml
[4]: #deadline-format
[5]: #timezones


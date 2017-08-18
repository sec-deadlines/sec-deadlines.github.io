# Security and Privacy deadlines countdown

Based on [ai-deadlines](https://aideadlin.es) by @abshkdz

## Adding/updating a conference

* Fork the repository
* Update `_data/conferences.yml`. See details below.
* Send a pull request

### Conference entry record

Example record:

```
- name: Euro S&P
  description: IEEE European Symposium on Security and Privacy
  year: 2018
  link: http://www.ieee-security.org/TC/EuroSP2018/
  deadline: "2017-08-15 23:59"
  date: April 24-26
  place: London, UK
  tags: [SEC, PRIV]
```

Descriptions of the fields:

| Field name    | Description                                                 |
|---------------|-------------------------------------------------------------|
| `name`\*      | Short conference name, without year                         |
| `year`\*      | Year the conference is happening                            |
| `description` | Description, or long name                                   |
| `link`\*      | URL to the conference home page                             |
| `deadline`\*  | Deadline, or list of deadlines. (Gory details below)        |
| `timezone`    | Timezone in [tz][1] format. By default is UTC-12 ([AoE][2]) |
| `date`        | When the conference is happening                            |
| `place`       | Where the conference is happening                           |
| `tags`        | One or multiple tags: `SEC`, `PRIV`, or `CRYPTO`            |

Fields mark with asterisk (\*) are required.


### Deadline format

Deadline field can contain:

1. Simplest option: a date and time in ISO format. Example: `"2017-08-19 23:59"`.
2. If a deadline is rolling, you can use template date, just substitute year with `%y`, or month with `%m`. Example: `"%y-%m-15 23:59"` means there is a deadline on the 15th day of every month, every year. `"2017-%m-15" means a deadline on 15th day of every month, but only in 2017, i.e. `"2018-01-15"` is not a part of this template.
2. A list of (1) or (2). Example of two rolling deadlines, one in the end of may every year, and second in the end of January:
  ```
  - "%y-05-31 23:59"
  - "%y-02-28 23:59"
  ```

On the page, all deadlines are displayed in viewer's local time (that's a feature).

*Note:* If deadline hour is `{h}:00`, it will be automatically translated into `{h-1}:59:59` to avoid pain and confusion when it happens to be midnight in local time.

### Timezones

Timezone is specified in [tz format][1]. Unlike abbreviations (e.g. EST), these are un-ambiguous. Here are tz codes for some common timezones:

| Common name                   | tz                                                                 |
|-------------------------------|--------------------------------------------------------------------|
| UTC                           | `Etc/UTC`                                                          |
| America Pacific Time          | `America/Los_Angeles`                                              |
| Pacific Standard Time (UTC-8) | `Etc/GMT+8` (Yes, sign is inverted. I know.)                       |
| America Eastern Time          | `America/New_York`                                                 |
| Eastern Standard Time (UTC-5) | `Etc/GMT+5`                                                        |
| American Samoa Time (UTC-11)  | `Pacific/Samoa` or `Etc/GMT+11`. This timezone does not use DST.   |
| Aleutian Islands              | `America/Adak`                                                     |

[1]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[2]: https://www.timeanddate.com/time/zones/aoe


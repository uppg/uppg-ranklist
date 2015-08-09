# uppg-ranklist
A new OJ ranklist based on JS and PHP.

## Summary
This is a new ranklist for some popular online competitive coding judges. Since this is based on JS and PHP, you can run
this using any webserver.

## Online Judges
This ranklist gets data from the UVa OJ, ACM ICPC Live Archive, and Project Euler. You can also suggest other OJs to add
provided that they have an API for the number of solved problems for a specific username.

**NOTE: The ranklist for Euler doesn't work since the website's database is broken.**

## Contributing
The file hierarchy is shown below:
```
uppg_ranklist
|-- jslib
  |-> get-ranks.js
  |-> jquery-2.1.4.min.js
  |-> q.min.js
  |-> jquery.tablesorter.min.js
|-- json
  |-> schoolid.json
  |-> users.json
|-- static
  |-> ...
|-> euler_json.php
|-> index.html
|-> script.js
|-> style.css
```

Data of OJs are parsed using `euler_json.php`, `jslib/get-ranks.js`, and `script.js`. User and school databases are located
in the `json` folder. The other files are library files or for HTML display purposes.

## Live Website
You can access the OJ ranklist at this [link] (http://swserver.eee.upd.edu.ph/staff/carl/uppg_ranklist) kindly hosted by the
UP EEEI SmartWire Server.

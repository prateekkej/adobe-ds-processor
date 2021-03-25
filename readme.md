# Data Source Automator

Use this Node package to automatically transform your data into Adobe Analytics Data Source Compatible format, upload it to FTP Location and get slack notifications

#   File Name formats

*   Data Files - data-LOOKUP_ID.csv
*   Lookup Files - lookup-LOOKUP_ID.json

#   How to use -

1.  Copy Data Extract into data directory and rename the files in this format *data-LOOKUP_ID.csv*.
2.  Create a lookup file using the *lookup-schema.json* or modify the sample ones from *lookups* directory.
3.  Update config.js as per your needs.
4.  Run the script and relax.
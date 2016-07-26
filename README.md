# Mobile Libraries

Project for displaying a mobile library timetable in a live departure/arrival style web dashboard.

## What is it?

Mobile library data includes stop locations, times, address details, numbe rof routes, day of the week, etc.  This is a project to visualise that data in a more interesting way than typical (often PDF) timetable listings.

## Supporting technologies

| Technology | Description |
| ---------- | ----------- |
| Web | HTML, JavaScript (with various libraries), and CSS |
| GIS & Python | A GIS route mapping service is used to generate routes between library stops.  This is called using a Python script. |

## Alternative library service

The application is designed to be easily customisable to an alternative mobile library service.

By modifying the [mobiles.config](js/mobiles.config) file and providing alternative data in the data folder, the solution can be made to work for any library service.  The python scripts provided should provide the means to create geocoordinate data (if not available already) and route data.

## Mobile library data

The data for the mobile libraries is held in the [somersetmobiles](somersetmobiles.csv) data, a comma separated values file with the following fields:

| Field | Description |
| ----- | ----------- |
|  |  | 

## Creating routes

Routes data is created by a python script, and makes use of a lookup service published 

## Third party licences




## Licence

Original code licensed with the [MIT Licence](licence.txt)
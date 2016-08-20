# Mobile Libraries

Project for displaying a mobile library timetable in a live departure/arrival style web dashboard.  This is currently deployed to:

[http://somersetmobiles.librarieshacked.org](http://somersetmobiles.librarieshacked.org)

## What is it?

Mobile library data includes stop locations, times, address details, number of routes, day of the week, etc.  This is a project to visualise that data in a more interesting way than typical (often PDF) timetable listings.

## Supporting technologies

| Technology | Description |
| ---------- | ----------- |
| Web | HTML, JavaScript (with various libraries), and CSS |
| GIS & Python | A GIS route mapping service is used to generate routes between library stops.  A python scripts creates the routes data.  This can be run on a once only basis (or whenever routes are changed).

## Alternative library service

The application is designed to be easily customisable to an alternative mobile library service.

By modifying the [mobiles.config](js/mobiles.config) file, and providing alternative data in the data folder, the solution can be made to work for any library service.  The python scripts provided should provide the means to create geo-coordinate point data (if not available already) and route data.

## Mobile library data

The data for the mobile libraries is held in the [somersetmobiles](data/somersetmobiles.csv) data, a comma separated values file with the following fields for each mobile library stop.

| Field | Description | Example |
| ----- | ----------- | ------- |
| Id | An auto-incrementing ID assigned to each stop, starting at 1.  Not shown in display but used in code to uniquely reference stops. | *1* |
| Mobile | The name of the mobile library | *Taunton* |
| Route | The route letter | *A* |
| Day | The day of the week | *Tuesday* |
| StartDate | The start date of the stop. | *4/12/2016* |
| Location | Short location description | *Week lane* |
| Postcode | Postcode of the stop | *TA24 7JL* |
| Start | The start time of the stop | *12:40* |
| End | The end time of the stop | *13:00* |
| Address | A full address for the stop | *Withypool Post Office, Withypool, TA24 7QP* |
| Place | Village or town name | *Winsford* |
| Lat | The latitude geocoordinate of the stop. | *51.10708* |
| Lng | The longitude geocoordinate of the stop. | *3.5800926* |

## Creating routes

Route data is created by a python script, [route-geocode.py](scripts/route-geocode.py), and makes use of an Open Street Map [Open Route Service](http://wiki.openstreetmap.org/wiki/OpenRouteService).  

Running this python script will create a series of XML files within the data directory.  These will then be used by the web application to display routes when selecting a particular mobile route.

## Third party licences

The solution makes use of a number of openly-licensed libraries, detailed here.

| Name | Description | Link | Licence |
| ---- | ----------- | ---- | ------- |
| Leaflet | Lightweight JavaScript interactive map framework | [Leaflet](http://leafletjs.com/) | [Open Source](https://github.com/Leaflet/Leaflet/blob/master/LICENSE) |
| Bootstrap | HTML, CSS, and JS framework for developing responsive, mobile first projects on the web | [Bootstrap](http://getbootstrap.com/) | [MIT](https://github.com/twbs/bootstrap/blob/master/LICENSE) |
| Bootswatch | Free themes for bootstrap.  This code makes use of the 'sandstone' theme.  | [Bootswatch](https://bootswatch.com/) | [MIT](https://github.com/thomaspark/bootswatch/blob/gh-pages/LICENSE) |
| Datatables | Table plug in allowing dynamic searching, sorting and filtering of HTML tables. | [DataTables](https://datatables.net/) | [MIT](https://datatables.net/license/mit) |
| JSZip | Required for the download of Excel files in DataTables. | [JSZip](https://stuk.github.io/jszip/) | [MIT](https://github.com/Stuk/jszip/blob/master/LICENSE.markdown) |
| Moment | A library of Date/Time manipulation and parsing functions | [Moment](http://momentjs.com/) | [MIT](https://github.com/moment/moment/blob/develop/LICENSE) |
| Papa Parse | Used for parsing CSV data. | [PapaParse](http://papaparse.com/) | [MIT](https://github.com/mholt/PapaParse/blob/master/LICENSE) |
| jQuery | Required by Bootstrap, Datatables and used for general JavaScript shortcuts | [jQuery](https://jquery.com/) | [MIT](https://github.com/twbs/bootstrap/blob/master/LICENSE) |

## Licence

Original code licensed with the [MIT Licence](LICENSE)
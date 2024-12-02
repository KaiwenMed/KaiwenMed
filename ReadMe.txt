This website is a prototype of a COVID vaccine store locator that allows users to search for stores by state, city, and zip code. The website also allows users to filter the search results by: 'Insurance Accepted', 'Walk-ins Accepted', 'In Stock', and 'Offers Free Masks'. 

The website has the following features:

DataTables plugin: This plugin is used to create a dynamic table that displays the search results. The table supports pagination, sorting, and searching functions. 

Datepicker plugin: This plugin is used to create a calendar widget that allows users to select a day of the week. The website then shows the opening hours for the selected day for each store.

Select2 plugin: This plugin is used to enhance the state and city dropdown menus. The plugin allows users to search and select from a list of options, as well as to clear their selection. 

Zip code search: The website allows users to search for stores by zip code, and supports partial matching. For example, searching for zip code 14001 will also return stores with zip code 14001-1308.

Google Maps API: The website uses the Google Maps API to display a map that shows the location of all the stores that match the search criteria. The map also shows markers for each store and information window that shows more details about the store, including the name, address, website, prescreen website, and provider notes. The information window can be opened by clicking on the marker or the corresponding row in the result table.

Note: Sometimes the website may have issues showing the map with the Chrome browser if refreshed multiple times, but it works well with the Firefox browser. Because the city names in the dataset are case-sensitive, so I includes both upper case and title case versions of the city names in the dropdown menu.
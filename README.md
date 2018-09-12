## Minnesota Legislative Coordinating Commission
### 2018 Elections mapping application

The **LCC Elections (webGL)** application is an open-source, full-stack, responsive (RWD) application, built with PostGIS, and Mapbox GL. 

See it in the wild at [http://gis.leg.mn](http://ww2.gis.leg.mn/iMaps/elections/2018/)

### What's included?
- Code
- Data (GeoJSON)
  - MN United States Congressional Districts
  - MN House Districts
  - MN Senate Districts
  - MN Municipal Boundaries
  - MN Counties
  - MN House, Senate, Congressional images

### What does it do?
- Fun geodev tools
  - Mapbox GL
  - Geocodes addresses (Google JavaScript API authentication token required)
  - Zooms to location on cellphones (application optimized using RWD)
- Basic UI/UX
  - Point and click on the map, or use the search bar to retrieve legislative data
  - Click on a legislative member to retrieve members district boundary or website
  - Add House/Senate overlay layers to geo-explore Minnesota's representative districts

The GeoJSON in the data folder is used in the app to add overlay layers to the map, this saves time and allows the browser to cache the responses, thus increasing the load time speed significantly better than PostGIS queries.
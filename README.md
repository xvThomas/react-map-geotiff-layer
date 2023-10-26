# react-map-geotiff-layer

Work in progress

## Run example in dev mode

### Get a mapbox token

- First register to [mapbox](https://account.mapbox.com/auth/signup/) and get a token (if you don't have one)
- Create a `.env` file with the following key:

```bash
MAPBOX_TOKEN=<your-token>
```

### Launch http-server

```bash
cd public
http-server -p 5625 --cors
```

### Build, compile and run

```bash
npm install
npm run build
npm start
```

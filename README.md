# React-map-geotiff-layer demo page

[Go to github page](https://xvthomas.github.io/react-map-geotiff-layer/)

## Run demo app locally

    yarn start

## Update Github page

    git checkout -b gh-pages
    rm -rf .parcel-cache
    yarn build
    git add *
    git commit -m "feat: update gh-pages"
    git push -u origin gh-pages

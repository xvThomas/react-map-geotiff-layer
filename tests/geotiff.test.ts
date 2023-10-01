import { getGeotiffData } from '../src/helpers/fetchGeotiff'

describe('Reading Geotiff', () => {
  it('renders without crashing', () => {})
  getGeotiffData('file://000000.tif, 0')().then((res) => console.log(res))
})

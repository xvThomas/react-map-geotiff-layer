import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'
import { GeotiffData, fetchGeotiff } from '../src/components/helpers/fetchGeotiff'
import { match } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'

let startedContainer: StartedTestContainer

describe('fetchGeotiff', () => {
  // beforeEach(async () => {})

  beforeAll(async () => {
    const container = await GenericContainer.fromDockerfile('./tests/images/httpServer/', 'dockerfile').build()

    startedContainer = await container
      .withExposedPorts(8080)
      .withWaitStrategy(Wait.forListeningPorts())
      .withCopyDirectoriesToContainer([
        {
          source: './public',
          target: '/site',
        },
      ])
      .start()
  }, 30000)

  afterAll(async () => {
    // await startedContainer.stop()
  }, 30000)

  it('should succeed when file exists', () => {
    pipe(
      fetchGeotiff(`http://${startedContainer.getHost()}:${startedContainer.getMappedPort(8080)}/test.tif`),
      match<Error, void, GeotiffData>(
        () => {
          throw new Error('test not expected to be a failure')
        },
        (geotiffData) => {
          expect(geotiffData.width).toBe(3)
          expect(geotiffData.height).toBe(3)
          expect(geotiffData.min).toBe(0)
          expect(geotiffData.max).toBe(8)
          expect(geotiffData.noDataValue).toBe(-32768)
        },
      ),
    )()
  })

  it('should fail when file is missing', () => {
    pipe(
      fetchGeotiff(`http://${startedContainer.getHost()}:${startedContainer.getMappedPort(8080)}/missing.tif`),
      match<Error, void, GeotiffData>(
        (e) => expect(e.message).toMatch(/(RangeError: Offset is outside the bounds of the DataView)/i),
        () => {
          throw new Error('test not expected to be a success')
        },
      ),
    )()
  })

  it('with wrong requested band should fail', () => {
    pipe(
      fetchGeotiff(`http://${startedContainer.getHost()}:${startedContainer.getMappedPort(8080)}/test.tif`, 1),
      match<Error, void, GeotiffData>(
        (e) => expect(e.message).toMatch(/(Error: band 1 not available)/i),
        () => {
          throw new Error('test not expected to be a success')
        },
      ),
    )()
  })
})

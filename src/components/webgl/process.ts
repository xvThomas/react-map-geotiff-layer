// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.onmessage = (_e: MessageEvent<string>) => {
  const result = 99999

  self.postMessage(result)
}

export {}

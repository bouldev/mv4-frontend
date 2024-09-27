export async function awaitSleep(ms: number) {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      return resolve(true);
    }, ms);
  });
}

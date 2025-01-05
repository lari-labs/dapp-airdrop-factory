import React from 'react';
const View = computation => ({
  fold: computation,
  map: f => View(props => f(computation(props))),
  contramap: g => View(props => computation(g(props))),
  // Borrowed from Brian Lonsdord's talk Oh Composable World
  // See: https://youtu.be/SfWR3dKnFIo?t=21m51s
  concat: other =>
    View(props => (
      <React.Fragment>
        {computation(props)}
        {other.fold(props)}
      </React.Fragment>
    )),
  inspect: () => `View$(${computation.toString()})`,
});
const Reader = computation => ({
  runReader: ctx => computation(ctx),

  map: f => Reader(ctx => f(computation(ctx))),

  ap: other =>
    Reader(ctx => {
      const fn = computation(ctx);
      return fn(other.runReader(ctx));
    }),
  chain: f =>
    Reader(ctx => {
      // Get the result from original computation
      const a = computation(ctx);

      // Now get the result from the computation
      // inside the Reader `f(a)`.
      return f(a).runReader(ctx);
    }),
});

Reader.ask = () => Reader(x => x);
export { Reader, View };

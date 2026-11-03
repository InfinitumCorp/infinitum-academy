// Static site: every request is answered from the built assets in dist/client.
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};

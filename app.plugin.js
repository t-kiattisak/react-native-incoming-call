const {
  withInfoPlist,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const pkg = require('./package.json');

/**
 * Adds iOS VoIP / audio background modes required for PushKit + CallKit.
 */
function withIncomingCallIos(config) {
  return withInfoPlist(config, (config) => {
    const modes = config.modResults.UIBackgroundModes ?? [];
    const required = ['voip', 'audio'];
    for (const mode of required) {
      if (!modes.includes(mode)) {
        modes.push(mode);
      }
    }
    config.modResults.UIBackgroundModes = modes;
    return config;
  });
}

module.exports = createRunOncePlugin(
  withIncomingCallIos,
  `${pkg.name}-ios-callkit`,
  pkg.version
);

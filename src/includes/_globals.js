import _ from 'lodash';
export default {
  install(app) {
    const baseComponents = import.meta.glob('../components/base/*.vue', {
      eager: true,
    });
    Object.entries(baseComponents).forEach(([path, module]) => {
      /**
       * remove the .vue extension from name, then camelCase it and then capitalize the first letter to convert into Pascal Case
       */
      // eslint-disable-next-line no-useless-escape
      const componentName = _.upperFirst(
        _.camelCase(
          path
            .split('/')
            .pop()
            .replace(/.[a-zA-Z0-9]+$/, ''),
        ),
      );
      console.log(
        '🚀 ~ file: _globals.js:10 ~ Object.entries ~ componentName:',
        path,
        componentName,
      );

      //   export default
      app.component(`${componentName}`, module.default);
    });
  },
};

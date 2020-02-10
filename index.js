#! /usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const { COPYFILE_FICLONE } = fs.constants;
const path = require('path');
const ENV_CURRENT = path.resolve(process.cwd(), '.env');
const ENV_DIR = path.resolve(process.cwd(), '.swenv');

/**
 * @return {Promise} - .env files list
 */
const fetchDotenvList = () => new Promise((resolve, reject) => {

  fs.readdir(ENV_DIR, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      return reject(`Not found ${ENV_DIR} path.\nYou create the ".swenv" directory.\nThen place the ".env-xxx" files in that directory.`);
    }

    const results = dirents
      .filter(dirent => !dirent.isDirectory())
      .map(dirent => dirent.name);

    if (0 === results.length) {
      return reject('Not found ".env-xxx" files.');
    }

    resolve(results);
  });
});


/**
 * @param {Array} - .env files list
 * @return {Promise}
 */
const whichReplace = (dotenvList = []) => {
  return inquirer
    .prompt({
      type: 'list',
      name: 'switchEnvFile',
      message: 'Which dot-file to replace ?',
      choices: dotenvList,
    })
    .then(answer => answer.switchEnvFile);
};

const replaceEnv = (selectEnv = '') => new Promise((resolve, reject) => {
  fs.copyFile(path.resolve(ENV_DIR, selectEnv), ENV_CURRENT, COPYFILE_FICLONE, (err) => {
    if (err) return reject(err);
    resolve();
  });
});

const main = async () => {
  const dotenvList = await fetchDotenvList();
  const selectEnv = await whichReplace(dotenvList);
  return replaceEnv(selectEnv);
};


main()
  .then(() => console.log('Replacement completed.'))
  .catch(err => console.error(err));

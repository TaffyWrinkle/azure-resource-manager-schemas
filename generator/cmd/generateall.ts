import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import { series } from 'async';
import { generateSchemas, clearAutogeneratedSchemas } from '../generate';
import { whitelist } from '../whitelist';
import chalk from 'chalk';

series([async () => {
    await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    await clearAutogeneratedSchemas();

    let errors = [];
    for (const whitelistConfig of whitelist) {
        try {
            const readme = await validateAndReturnReadmePath(whitelistConfig.basePath);

            await generateSchemas(readme, whitelistConfig);
        } catch(error) {
            console.log(chalk.red(`Caught exception processing whitelist entry ${whitelistConfig.basePath}.`));
            console.log(chalk.red(error));

            errors.push(error);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Autogeneration failed with ${errors.length} errors. See logs for detailed information.`);
    }
}]);
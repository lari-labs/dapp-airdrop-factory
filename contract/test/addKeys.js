import { exec } from 'child_process';
import util from 'util';
import { merkleTreeObj } from '../generated_keys.js';

const TEST_ACCOUNTS = merkleTreeObj.accounts.slice(100);

const execPromise = util.promisify(exec); // Makes exec use promises

async function addKeys() {
  for (const account of TEST_ACCOUNTS) {
    const command = `echo "${account.mnemonic}" | agd keys add "${account.name}" --recover`;
    try {
      const { stdout, stderr } = await execPromise(command);
      console.log(
        `Key ${account.name} added.\nStdout:\n${stdout}\nStderr:\n${stderr}`,
      );
    } catch (error) {
      console.error(`Error adding key ${account.name}:`, error);
    }
  }
}

addKeys();

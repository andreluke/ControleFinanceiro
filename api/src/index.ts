import "dotenv/config";

import { buildApp } from "./config/app";
import { env } from "./settings/env";

async function start() {
	const app = await buildApp();

	app.listen({ port: env.PORT, host: "0.0.0.0" }, (err) => {
		if (err) {
			app.log.error(err);
			process.exit(1);
		}
		app.log.info(`Server running on port ${env.PORT}`);
	});
}

start();

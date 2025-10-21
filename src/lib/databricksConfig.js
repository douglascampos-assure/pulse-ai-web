export const databricksConfig = {
  serverHostname: process.env.DATABRICKS_HOST,
  httpPath: process.env.DATABRICKS_HTTP_PATH,
  accessToken: process.env.DATABRICKS_TOKEN,
};

const requiredFields = ["serverHostname", "httpPath", "accessToken"];
requiredFields.forEach((field) => {
  if (!databricksConfig[field]) {
    throw new Error(
      `Falta la variable de entorno: DATABRICKS_${field.toUpperCase()}`
    );
  }
});

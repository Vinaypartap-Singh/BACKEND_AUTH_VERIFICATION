import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const formatError = (error) => {
    let errors = {};
    error.errors?.map((error) => {
        errors[error.path?.[0]] = error.message;
    });
    return errors;
};
export const renderEmailEjs = async (fileName, payload) => {
    const html = await ejs.renderFile(__dirname + `/views/emails/${fileName}.ejs`, payload);
    return html;
};

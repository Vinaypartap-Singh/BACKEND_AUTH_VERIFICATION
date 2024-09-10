import { ZodError } from "zod";
import path from "path"
import { fileURLToPath } from "url"
import ejs from "ejs"
import moment from "moment";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const formatError = (error: ZodError): any => {
    let errors = {}
    error.errors?.map((error) => {
        errors[error.path?.[0]] = error.message
    })

    return errors
}

export const renderEmailEjs = async (fileName: string, payload: any) => {
    const html: string = await ejs.renderFile(
        __dirname + `/views/emails/${fileName}.ejs`,
        payload
    );
    return html;
};


export const checkDateHourDiff = (date: Date | string): number => {
    const now = moment()
    const tokenSendAt = moment(date)
    const difference = moment.duration(now.diff(tokenSendAt))
    return difference.asHours()
}
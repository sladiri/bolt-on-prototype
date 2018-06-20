import proxy from "http2-proxy";

const protocol = "http";
const hostname = "localhost";
const port = 5984;

export const couchDbProxy = async ctx => {
    await new Promise((resolve, reject) => {
        try {
            proxy.web(
                ctx.req,
                ctx.res,
                {
                    protocol,
                    hostname,
                    port,
                    onReq: mapPathToDbName({ path: ctx.path }),
                },
                error => {
                    error ? reject(error) : resolve();
                },
            );
        } catch (error) {
            reject(error);
        }
    });
};

export const mapPathToDbName = ({ path }) => (req, options) => {
    const dbName = path;
    options.path = dbName;
};

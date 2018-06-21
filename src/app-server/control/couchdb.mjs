import proxy from "http2-proxy";

export const couchDbProxy = ({ protocol, hostname, port }) => async ctx => {
    await new Promise((resolve, reject) => {
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
    });
};

export const mapPathToDbName = ({ path }) => (req, options) => {
    const dbName = path;
    options.path = dbName;
};

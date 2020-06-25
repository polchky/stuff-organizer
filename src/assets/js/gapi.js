let gapi;
let fileId;
const fileName = 'app_file.json';
const defaultAppFile = {
    containers: [],
};

const gapiManager = {

    async init(gapiPromise) {
        gapi = await gapiPromise;
    },

    async signIn() {
        const auth = gapi.auth2.getAuthInstance();
        await auth.signIn();
        const scopes = auth.currentUser.get().getGrantedScopes();
        if (!scopes.split(' ').includes('https://www.googleapis.com/auth/drive.appdata')) {
            await auth.signOut();
            return false;
        }
        return true;
    },

    isSignedIn() {
        return gapi && gapi.auth2.getAuthInstance().isSignedIn.get();
    },

    createAppFile() {
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const contentType = 'application/json';
        const metadata = {
            name: fileName,
            parents: ['appDataFolder'],
            mimeType: contentType,
        };

        const multipartRequestBody = `${delimiter}Content-Type: ${contentType}\r\n\r\n${JSON.stringify(metadata)}${delimiter}Content-Type: ${contentType}\r\n\r\n${JSON.stringify(defaultAppFile)}${closeDelim}}`;

        const reqObj = {
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: {
                uploadType: 'multipart',
            },
            headers: {
                'Content-Type': `multipart/mixed; boundary="${boundary}"`,
            },
            body: multipartRequestBody,
        };
        return gapi.client.request(reqObj);
    },

    async getAppFile() {
        let res;
        if (!fileId) {
            // List existing app files
            res = await gapi.client.drive.files.list({
                spaces: ['appDataFolder'],
                fields: 'files(id)',
            });
            if (res.status !== 200) return res;

            // Get file ID
            if (res.result.files.length > 0) {
                fileId = res.result.files[0].id;
            } else {
                res = await gapiManager.createAppFile();
                if (res.status !== 200) return res;
                fileId = res.result.id;
            }
        }
        // await gapi.client.drive.files.delete({ fileId });
        // Get file
        return gapi.client.drive.files.get({
            fileId,
            alt: 'media',
        });
    },

    updateAppFile(data) {
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const contentType = 'application/json';
        const metadata = {
            mimeType: contentType,
        };

        const multipartRequestBody = `${delimiter}Content-Type: ${contentType}\r\n\r\n${JSON.stringify(metadata)}${delimiter}Content-Type: ${contentType}\r\n\r\n${JSON.stringify(data)}${closeDelim}}`;

        const reqObj = {
            path: `/upload/drive/v3/files/${fileId}`,
            method: 'PATCH',
            params: {
                uploadType: 'multipart',
            },
            headers: {
                'Content-Type': `multipart/mixed; boundary="${boundary}"`,
            },
            body: multipartRequestBody,
        };
        return gapi.client.request(reqObj);
    },

    async deleteAppFile() {
        if (!fileId) return false;
        const res = await gapi.client.drive.files.delete({ fileId });
        return res.status === 204;
    },
};

module.exports = gapiManager;

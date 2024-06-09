
const endpoint = "https://rnkqnviezsjkhfovplik.supabase.co/storage/v1/object/public/";
const bucket = "program_media/";

const imageEndpoint = () => {
    return `${endpoint}${bucket}`;
}

export default imageEndpoint;


import { Link } from 'react-router';
import type { Route } from './+types/library';
import { datalayer } from '../datalayer';
import type {Config} from "../services/ConfigApi";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const config: Config = await datalayer.configApi.getConfig();
    if (!config) {
        throw new Response('Not Found', { status: 404 });
    }
    return { config };
}

async function handleChangeCachePlexNotification(config: Config) {
    console.log('set cache plex notification: ', config);
    await datalayer.configApi.setCachePlexNotifications(!config.cache_plex_notifications)
}

async function handleChangeLibrarySizes(config: Config) {
    console.log('set cache plex notification: ', config);
    await datalayer.configApi.setEnableLibrarySizes(!config.calculate_library_sizes)
}

async function handleChangeItemSizes(config: Config) {
    console.log('set cache plex notification: ', config);
    await datalayer.configApi.setEnableItemSizes(!config.calculate_item_sizes)
}


export default function Settings({ loaderData }: Route.ComponentProps) {
    const config: Config = loaderData.config;
    console.log(config)


    return (
        <div>
            <div className="font-bold m-5">NOTE: These aren't actually hooked up yet!!</div>

            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Cache Plex scanning messages </span>
                    <input type="checkbox" className="toggle" defaultChecked={config.cache_plex_notifications}  onChange={event => handleChangeCachePlexNotification(config)} />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Enable library sizes </span>
                    <input type="checkbox" className="toggle" defaultChecked={config.calculate_library_sizes} onChange={event => handleChangeLibrarySizes(config)} />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Enable item sizes </span>
                    <input type="checkbox" className="toggle" defaultChecked={config.calculate_item_sizes}  onChange={event => handleChangeItemSizes(config)} />
                </label>
            </div>
        </div>
    );
}
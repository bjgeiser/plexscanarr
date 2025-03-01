import { Link } from 'react-router';
import type { Route } from './+types/library';
import { datalayer } from '../datalayer';
import type {Config} from "../services/ConfigApi";


async function handleChangeCachePlexNotification() {
    console.log('set cache plex notification: ');
    await datalayer.configApi.setCachePlexNotifications(!datalayer.configApi.config.cache_plex_notifications)
}

async function handleChangeLibrarySizes() {
    console.log('set cache plex notification: ');
    await datalayer.configApi.setEnableLibrarySizes(!datalayer.configApi.config.calculate_library_sizes)
}

async function handleChangeItemSizes() {
    console.log('set cache plex notification: ');
    await datalayer.configApi.setEnableItemSizes(!datalayer.configApi.config.calculate_item_sizes)
}

async function handleChangeItemLocations() {
    console.log('set include item locations: ');
    await datalayer.configApi.setIncludeItemLocations(!datalayer.configApi.config.include_item_locations)
}


export default function Settings({ loaderData }: Route.ComponentProps) {

    return (
        <div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Cache Plex scanning messages </span>
                    <input type="checkbox" className="toggle" defaultChecked={datalayer.configApi.config.cache_plex_notifications}  onChange={event => handleChangeCachePlexNotification()} />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Enable library sizes </span>
                    <input type="checkbox" className="toggle" defaultChecked={datalayer.configApi.config.calculate_library_sizes} onChange={event => handleChangeLibrarySizes()} />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Enable item sizes </span>
                    <input type="checkbox" className="toggle" defaultChecked={datalayer.configApi.config.calculate_item_sizes}  onChange={event => handleChangeItemSizes()} />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Include item locations </span>
                    <input type="checkbox" className="toggle" defaultChecked={datalayer.configApi.config.include_item_locations}  onChange={event => handleChangeItemLocations()} />
                </label>
            </div>
        </div>
    );
}
import { Link } from 'react-router';

export default function Settings() {
    return (
        <div>
            <div className="font-bold m-5">NOTE: These aren't actually hooked up yet!!</div>

            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Cache Plex scanning messages </span>
                    <input type="checkbox" className="toggle" defaultChecked />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Enable library sizes </span>
                    <input type="checkbox" className="toggle" defaultChecked />
                </label>
            </div>
            <div className="form-control font-bold">
                <label className="label cursor-pointer">
                    <span className="label-text ml-5 mr-5">Enable item sizes </span>
                    <input type="checkbox" className="toggle" defaultChecked />
                </label>
            </div>
        </div>
    );
}
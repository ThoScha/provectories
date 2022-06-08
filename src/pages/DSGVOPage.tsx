import * as React from 'react';
import { NextPageButton } from './NextPageButton';

export function FirstPage({ nextPage }: { nextPage: () => void }) {
    const [confirmed, setConfirmed] = React.useState<boolean>(false);

    return <div>
        <h2>Welcome to the suvery</h2>
        <div className="form-check">
            <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckChecked"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)} />
            <label className="form-check-label" htmlFor="flexCheckChecked">
                Checked checkbox
            </label>
        </div>
        {confirmed ? <NextPageButton onButtonClick={nextPage} /> : null}
    </div>
}
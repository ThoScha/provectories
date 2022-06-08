import * as React from 'react';

export function QuestionPage({ children }: { children: React.ReactChild }) {
    return <div>
        <h5>Frage 1</h5>
        {children}
    </div>
}
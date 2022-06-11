import React from "react";

export function MailLink({ mail }: { mail: string }) {
    return <a className="link-primary" href={`mailto:${mail}`}>{mail}</a>
}
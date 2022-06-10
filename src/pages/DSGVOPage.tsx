import * as React from 'react';

export function FirstPage({
	setShowNextButton
}: {
	setShowNextButton: (showNextButton: boolean) => void;
}) {
	const [showMore, setShowMore] = React.useState<boolean>(false);
	const [confirmed, setConfirmed] = React.useState<boolean>(false);

	return <div>
		<h2>Welcome to the suvery</h2>
		<p>
			[Einführung zum Thema der Studie]
		</p>
		<b>
			Warum erheben und verarbeiten wir Ihre Daten?
		</b>
		<p>
			Bei der Studie handelt es sich um eine rein wissenschaftliche Studie, die vom Institut für Wirtschaftsinformatik/
			Software Engineering und dem Institut für Computergrafik der Johannes Kepler Universität Linz durchgeführt wird.
			Die Daten werden vorrangig dazu genutzt, wissenschaftliche Erkenntnisse zu erzielen. Jedwede Veröffentlichung erfolgt in anonymer Form.
		</p>
		<p>
			Die Teilnahme an der Studie ist ganz und gar freiwillig. Sie können jederzeit und ohne Angabe von Gründen Ihr Einverständnis
			zur Teilnahme zurücknehmen, ohne dass Ihnen hieraus irgendwelche Nachteile entstehen.
		</p>
		<p>
			Mit der untenstehenden Teilnahmeerklärung, bestätigen Sie die Probandeninformation und Datenschutzinformationen
			gelesen und Ziel, Ablauf und Durchführung der Studie, sowie die datenschutzrechtlichen Bestimmungen verstanden zu
			haben. Zudem willigen Sie durch die Bestätigung der untenstehenden Teilnahmeerklärung freiwillig in die Teilnahme
			an der Studie ein und bestätigen, dass Sie über 18 Jahre alt sind.
		</p>
		<b>Wie können Sie uns kontaktieren?</b>
		<p>
			Verantwortliche der in der Folge beschriebenen Datenverarbeitung im Sinne des Art 4 Ziff. 7 DSGVO ist die
			Johannes Kepler Universität Linz (JKU), Altenberger Straße 69, 4040 Linz, <a href="datenschutz@jku.at">datenschutz@jku.at</a>. Bei Fragen zur
			Studie, wenden Sie sich bitte an Thomas-Johann Schachinger, Johannes Kepler Universität Linz,
			Altenberger Straße 69, 4040 Linz, <a href="mailto:thomas.schachinger@icloud.com">thomas.schachinger@icloud.com</a> oder <a href="cg@jku.at">cg@jku.at</a>.
		</p>
		<p>
			Wenn Sie mehr Information über die Verarbeitung Ihrer personenbezogenen Daten wünschen, <a role="button" onClick={() => setShowMore(true)} href="/#">bitte hier klicken</a>.
		</p>
		<div className="form-check mb-3">
			<input
				className="form-check-input"
				type="checkbox"
				id="flexCheckChecked"
				checked={confirmed}
				onChange={(e) => {
					setConfirmed(e.target.checked);
					setShowNextButton(true);
				}} />
			<label className="form-check-label" htmlFor="flexCheckChecked">
				<b>
					Ich stimme zu, dass meine personenbezogenen Daten gemäss den hier aufgeführten Angaben verarbeitet werden.
				</b>
			</label>
		</div>
		{!showMore ? null : <>
			<b>
				Information zur Datenverarbeitung
			</b>
			<b>
				Wie lange werden die personenbezogenen Daten verarbeitet?
			</b>
			<p>
				Die im Rahmen der Studie erhobenen Daten werden von einem elektronischen Datensystem erfasst und statistisch
				ausgewertet. Nach Beendigung der Studie werden alle Daten nach den derzeit gültigen Richtlinien entsprechend
				gespeichert und archiviert.
			</p>
			<p>
				Die vollständig anonymisierten Daten dieser Studie können spätestens fünf Jahre nach Abschluss der Studie als offene
				Daten im Internet in einem Datenarchiv zugänglich gemacht werden. Damit folgt diese Studie den Empfehlungen der
				Deutschen
				Forschungsgesellschaft (DFG) und der Deutschen Gesellschaft für Psychologie (DGPs) zur Qualitätssicherung in der
				Forschung.
			</p>
			<b>Welche personenbezogenen Daten werden erfasst und verarbeitet?</b>
			<p>
				Es werden zwar Informationen zu Ihrer Person inklusive Geschlecht, Alter, und Bildungsniveau erfragt, durch die
				Anonymität der Umfrage, sind Sie durch diese Informationen nicht identifizierbar.
			</p>
			<p>
				Unmittelbar personenbezogene oder personenbeziehbare Daten, die Rückschlüsse auf Ihre Identität zulassen, werden
				nicht erfasst.
			</p>
			<b>
				Welche besondere Kategorien personenbezogener Daten werden erfasst und verarbeitet?
			</b>
			<p>
				Keine
			</p>
			<b>
				Gesetzliche Grundlage für die Verarbeitung
			</b>
			<p>
				Die Verarbeitung basiert auf der Zustimmung des Datensubjekts.
			</p>
			<b>
				Datenübermittilung in ein Land ausserhalb der EU/EWR oder an eine international Organisation, und Datenübermittlung
				vorbehaltlich
				geeigneter Garantien
			</b>
			<p>
				Die anonymisierten Daten werden dem Auftraggeber der Studie oder einer von dieser beauftragten Stelle zu
				wissenschaftlichen
				Zwecken oder zum Zwecke der Universitären Lehre zur Verfügung gestellt. Die anonymisierten Daten können im Zuge
				internationaler
				Forschungszusammenarbeiten auch Personen aus Nicht-EU-Mitgliedstaaten zur Verfügung gestellt werden.
			</p>
			<b>
				Gesetzliche oder vertragliche Auflage
			</b>
			<p>
				Jedwede Veröffentlichung von Forschungsergebnissen erfolgt in anonymer Form. Damit ist gewährleistet, dass hierüber
				Rückschlüsse auf Sie als Person unmöglich sind. Die Beachtung des Bundesdatenschutzgesetzes ist in vollem Umfang
				sichergestellt.
			</p>
			<b>
				Automatisiertes Verfahren
			</b>
			<p> Auf Basis Personenzeogener Daten erfolgen keine automatisierten Entscheidungsprozesse.</p>
			<b>
				Information zu den Rechten der Datensubjekte
			</b>
			<p>
				Da keine personenbezogenen Daten erhoben werden, ist nach Abschluss der Datenerhebung prinzipiell keine
				Zuordnung mehr zwischen den Daten im Datensatz und direkt personenbezogenen Daten (z.B. IP-Adresse) möglich ist –
				der Datensatz ist anonym. Das heißt, nach Abschluss dieser Datenerhebung ist keine gezielte Löschung Ihres
				persönlichen Datensatzes mehr möglich, da dieser nicht zugeordnet werden kann.
			</p>
			<b>
				Information über das Recht, die Zustimmung zu widerrufen
			</b>
			<p>
				Die Teilnahme an der Studie ist ganz und gar freiwillig. Sie können jederzeit und ohne Angabe von Gründen Ihr
				Einverständnis zur Teilnahme zurücknehmen, ohne dass Ihnen hieraus irgendwelche Nachteile entstehen.
			</p>
			<p>
				Die Verarbeitung der Daten vor dem Widerruf der Zustimmung bleibt rechtmäßig.
			</p>
			<b>
				Datenschutzbehörde
			</b>
			<p>
				Darüber hinaus kann sich die betroffene Person über eine ihrer Auffassung nach unzulässige Datenverarbeitung
				bei der österreichischen Datenschutzbehörde, Barichgasse 40-42, 1030 Wien, Tel.: + 43 1 52 152-0, E-Mail:
				<a href="dsb@dsb.gv.at">dsb@dsb.gv.at</a>
				beschweren.
			</p>
			<b>
				Unser Datenschutzbeauftragter
			</b>
			<p>
				Der Datenschutzbeauftragte im Sinne des Art 37 DSGVO ist erreichbar unter Johannes Kepler Universität Linz (JKU),
				Stabstelle Datenschutz, Altenberger Straße 69, 4040 Linz, datenschutz@jku.at.
			</p>
		</>}
	</div>
}

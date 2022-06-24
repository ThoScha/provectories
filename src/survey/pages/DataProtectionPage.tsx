import * as React from 'react';
import { MailLink } from '../../utils/MailLink';

export function DataProtectionPage({
	setShowNextButton
}: {
	setShowNextButton: (showNextButton: boolean) => void;
}) {
	const [showMore, setShowMore] = React.useState<boolean>(false);
	const [confirmed, setConfirmed] = React.useState<boolean>(false);

	return <div>
		<h2>Data Protection</h2>
		<b>
			Why do we collect and process your data?
		</b>
		<p>
			The study is a purely scientific study conducted by the Institute of Business Informatics - Software Engineering
			and the Institute for Computer Graphics at the Johannes Kepler University Linz. In this survey no sensitive personal
			data will be collected. The generated data will be used primarily to generate scientific insights. Any publication
			of the data will be in fully anonymous form.
		</p>
		<p>
			Participation in the study is entirely voluntary. You may withdraw your consent to participate at any
			time and without giving any reason, without incurring any disadvantages.
		</p>
		<p>
			With the declaration of participation below, you confirm that you have read the subject information and
			data protection information and that you have understood the aim, procedure and implementation of the study,
			as well as the data protection regulations. In addition, by confirming the declaration of participation below,
			you voluntarily agree to participate in the study and confirm that you are over 18 years of age.
		</p>
		<b>How can you contact us?</b>
		<p>
			The responsible party for the procesing of the data described below within the meaning of Art 4 No. 7 GDPR is
			Johannes Kepler University Linz (JKU), Altenberger Straße 69, 4040 Linz, <MailLink mail={'datenschutz@jku.at'} />.
			If you have any questions about the study, please contact Thomas-Johann Schachinger, Johannes Kepler University Linz,
			Altenberger Straße 69, 4040 Linz, <MailLink mail={'thomas.schachinger@icloud.com'} /> or{' '}
			<MailLink mail={'cg@jku.at'} />.
		</p>
		<p>
			If you would like more information about the processing of your personal data,{' '}
			<button
				className=" btn btn-link pb-1 p-0 text-decoration-none"
				type="button"
				onClick={() => setShowMore(true)}
			>
				please click here
			</button>.
		</p>

		<div className="form-check mt-4 mb-5 ms-1">
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
					I consent to the processing of my personal data in accordance with the information provided here.
				</b>
			</label>
		</div>
		{!showMore ? null : <>
			<h4>
				Information on data processing
			</h4>
			<b>
				How long will the personal data be processed?
			</b>
			<p>
				The fully anonymized data collected as part of the study will be recorded and
				statistically analyzed by an electronic data system. After completion of the study,
				all data will be stored and archived according to the currently valid guidelines.
				The data of this study can be made accessible as open data on the Internet in a
				data archive no later than five years after completion of the study. Thus, this
				study follows the recommendations of the German Research Foundation (DFG) and the
				German Psychological Society (DGPs) for quality assurance in research.
			</p>
			<b>What personal data are collected and processed?</b>
			<p>
				We will collect no personal data, except gender, age and experience that participants specify
				themselves, and no data of computer devices. Due to the anonymity of the survey, you are not
				identifiable by this information. Directly personal or personally identifiable data that allows
				conclusions to be drawn about your identity is not collected.
			</p>
			<b>
				What special categories of personal data are collected and processed?
			</b>
			<p>
				None
			</p>
			<b>
				Legal basis for processing
			</b>
			<p>
				Processing is based on the consent of the data subject.
			</p>
			<b>
				Data transfer to a country outside the EU/EEA or to an international organization,
				and data transfer subject to appropriate safeguards.
			</b>
			<p>
				The anonymized data will be made available to the client of the study or to a body
				appointed by the client for scientific purposes or for the purpose of university teaching.
				The anonymized data may also be made available to persons from non-EU member states in the
				course of international research collaborations.
			</p>
			<b>
				Legal or contractual requirement
			</b>
			<p>
				Any publication of research results is done anonymously. This ensures that it is impossible
				to draw conclusions about you as a person. Compliance with the Federal Data Protection Act is
				ensured in full.
			</p>
			<b>
				Automated procedure
			</b>
			<p>
				No automated decision-making processes are carried out on the basis of personal data.
			</p>
			<b>
				Information on the rights of data subjects
			</b>
			<p>
				Since no personal data is collected, once data collection is complete, it is no longer
				possible to link the data in the data record to directly personal data (e.g., IP address) -
				the data record is anonymous. This means that after completion of this data collection,
				it is no longer possible to specifically delete your personal data record, as it cannot be
				identified.
			</p>
			<b>
				Information about the right to withdraw consent
			</b>
			<p>
				Participation in the study is entirely voluntary. You can withdraw your consent to
				participate at any time and without giving reasons, without incurring any disadvantages.
				The processing of data prior to the withdrawal of consent remains lawful.
			</p>
			<b>
				Data protection authority
			</b>
			<p>
				In addition, data subjects may complain about what they consider to be unlawful data processing
				to the Austrian Data Protection Authority, Barichgasse 40-42, 1030 Vienna, Tel.: + 43 1 52 152-0, e-mail:{' '}
				<MailLink mail={'dsb@dsb.gv.at'} />.
			</p>
			<b>
				Our data protection officer
			</b>
			<p>
				The data protection officer within the meaning of Art 37 GDPR can be reached at Johannes Kepler University
				Linz (JKU), Data Protection Unit, Altenberger Straße 69, 4040 Linz, <MailLink mail={'datenschutz@jku.at'} />.
			</p>
		</>}
	</div>
}

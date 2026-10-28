import { useEffect, useState } from "react";

/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const RELEASES_URL = "https://github.com/YoanCuervo/Atropos/releases";

/**
 * The installed version and a link to the published releases. Atropos makes no
 * network request of its own: the user compares versions in the browser.
 *
 * @param {object} props
 * @param {Messages["about"]} props.aboutMessages
 */
function AboutSettings({ aboutMessages }) {
  const [applicationVersion, setApplicationVersion] = useState(
    /** @type {string | null} */ (null),
  );
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    window.atropos.getApplicationVersion().then(
      (receivedApplicationVersion) => {
        if (isMounted) {
          setApplicationVersion(receivedApplicationVersion);
        }
      },
      () => {
        if (isMounted) {
          setHasLoadFailed(true);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="card settings-section" aria-labelledby="about-title">
      <h3 id="about-title" className="card__title settings-section__title">
        {aboutMessages.title}
      </h3>
      <dl className="settings-about">
        <dt className="settings-field__label">{aboutMessages.versionLabel}</dt>
        <dd className="settings-about__version">
          {hasLoadFailed
            ? aboutMessages.versionUnknown
            : (applicationVersion ?? "…")}
        </dd>
      </dl>
      <p className="settings-section__text">{aboutMessages.privacyNote}</p>
      <p className="settings-field__hint">{aboutMessages.releasesHint}</p>
      <a
        className="settings-button settings-button--link"
        href={RELEASES_URL}
        target="_blank"
        rel="noreferrer"
      >
        {aboutMessages.releasesLink}
      </a>
    </section>
  );
}

export default AboutSettings;

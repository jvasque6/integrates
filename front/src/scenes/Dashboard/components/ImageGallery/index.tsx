/* tslint:disable jsx-no-multiline-js
 * Disabling this rule is necessary for the sake of
 * readability of the code that dynamically creates the columns
 */
import React from "react";
import { Col } from "react-bootstrap";
import ReactImageGallery, { ReactImageGalleryProps } from "react-image-gallery";
/* tslint:disable-next-line:no-import-side-effect no-submodule-imports
 * Disabling this two rules is necessary for
 * allowing the import of default styles that ReactImageGallery needs
 * to display properly even if some of them are overridden later
 */
import "react-image-gallery/styles/css/image-gallery.css";

const imageGallery: React.FunctionComponent<ReactImageGalleryProps> =
  (props: ReactImageGalleryProps): JSX.Element => (
    <React.StrictMode>
      <div>
        <Col xs={12} sm={12} md={6} mdOffset={3}>
          <ReactImageGallery
            infinite={props.infinite}
            items={props.items}
            showBullets={props.showBullets}
            showFullscreenButton={props.showFullscreenButton}
            showIndex={props.showIndex}
            showNav={props.showNav}
            showPlayButton={props.showPlayButton}
            showThumbnails={props.showThumbnails}
            thumbnailPosition={props.thumbnailPosition}
          />
        </Col>
      </div>
    </React.StrictMode>
  );

imageGallery.defaultProps = {
  infinite: true,
  showFullscreenButton: true,
  showIndex: true,
  showNav: true,
  showPlayButton: false,
  showThumbnails: true,
};

export = imageGallery;

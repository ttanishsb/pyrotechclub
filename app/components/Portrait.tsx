import type { Member } from '../data/members';
import { pad } from '../data/members';

/**
 * A 4:5 portrait frame. Shows the member's photo if one is set, otherwise a
 * placeholder drawn with the same corner-bracket motif as the cursor reticle.
 */
export default function Portrait({ member, index }: { member: Member; index: number }) {
  const hasImage = Boolean(member.image);
  return (
    <div className="portrait" data-has-image={hasImage}>
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="portrait-img" src={member.image} alt={member.name} loading="lazy" draggable={false} />
      ) : (
        <div className="portrait-empty" aria-hidden="true">
          <i className="portrait-corner portrait-corner--tl" />
          <i className="portrait-corner portrait-corner--tr" />
          <i className="portrait-corner portrait-corner--bl" />
          <i className="portrait-corner portrait-corner--br" />
          <span className="portrait-num">{pad(index)}</span>
          <span className="portrait-hint">Photo</span>
        </div>
      )}
    </div>
  );
}

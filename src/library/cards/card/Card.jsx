import './Card.css';

export default function Card({ title, description, media = null, footer = null, hoverable = false, children, ...rest }) {
  return (
    <article className={`scard${hoverable ? ' scard--hover' : ''}`} {...rest}>
      {media && <div className="scard__media">{media}</div>}

      <div className="scard__body">
        {title && <h3 className="scard__title">{title}</h3>}
        {description && <p className="scard__desc">{description}</p>}
        {children}
      </div>

      {footer && <div className="scard__footer">{footer}</div>}
    </article>
  );
}

import { IconWhatsapp } from './Icons';

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/919025116369"
      target="_blank"
      rel="noreferrer"
      className="wa-float"
      aria-label="Chat with us on WhatsApp"
    >
      <IconWhatsapp size={26} />
    </a>
  );
}

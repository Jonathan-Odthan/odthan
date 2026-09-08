import Image from "next/image";
import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, number> = {
  sm: 36,
  md: 56,
  lg: 96,
};

interface LogoProps {
  size?: LogoSize;
  withLabel?: boolean;
  href?: string;
  /**
   * Chemin de l'image du logo. Chaque application doit copier
   * /packages/ui/assets/odthan-logo.png dans son dossier /public/images/.
   */
  src?: string;
}

/**
 * Logo officiel ODTHAN : emblème doré sur fond noir.
 * Utilisé dans le Header, le Footer, les emails et l'écran de connexion.
 */
export function Logo({ size = "md", withLabel = true, href = "/", src = "/images/odthan-logo.png" }: LogoProps) {
  const px = sizeMap[size];

  const content = (
    <span className="odthan-logo" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <Image
        src={src}
        alt="ODTHAN"
        width={px}
        height={px}
        priority
        style={{ objectFit: "contain" }}
      />
      {withLabel && (
        <span
          style={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontSize: size === "lg" ? 28 : size === "md" ? 20 : 16,
            color: "#F1D77A",
          }}
        >
          ODTHAN
        </span>
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

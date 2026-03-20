import { Zap } from 'lucide-react';

const columns = [
  { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
  {
    title: 'Resources',
    links: ['Documentation', 'Blog', 'Tutorials', 'Support'],
  },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-bg rounded-lg p-1.5">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Hirentis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered interview preparation platform for modern candidates.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Hirentis. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

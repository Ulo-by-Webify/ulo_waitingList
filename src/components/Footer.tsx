import React from 'react';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Links',
      links: [
        { title: 'About', href: '#' },
        { title: 'Products', href: '#' },
        { title: 'Privacy', href: '#' },
        { title: 'Terms', href: '#' }
      ]
    },
    {
      title: 'Business',
      links: [
        { title: 'Advertising', href: '#' },
        { title: 'Solutions', href: '#' },
        { title: 'How Search works', href: '#' }
      ]
    },
    {
      title: 'Developers',
      links: [
        { title: 'Ulo API', href: '#' },
        { title: 'Ulo Cloud', href: '#' },
        { title: 'Ulo Maps Platform', href: '#' }
      ]
    },
    {
      title: 'Help',
      links: [
        { title: 'Support', href: '#' },
        { title: 'Contact', href: '#' },
        { title: 'Community', href: '#' }
      ]
    }
  ]

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid  justify-center">
          <div className="">
            <h3 className="text-4xl lg:text-5xl text-center font-bold text-gray-900 mb-3">
              Now you can belong <br />anywhere in Africa.
            </h3>
            <p className="text-xl text-center text-gray-600">
              Experience African from Inside.
            </p>
            <img src="/ulo-icon.png" alt="Ulo" className="h-20 mx-auto mt-20" />
            <p className="text-sm mt-20 text-center  text-gray-600">
              Prices and services may differ depending on location.
            </p>
          </div>
          {/* {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-medium text-gray-900 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="hover:text-gray-900">
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))} */}
        </div>
        <div className=" flex justify-center border-t border-gray-200 mt-8 pt-8 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Ulo LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
};

export default Footer;

import NavigationMenu from '../navbar/component';
import Footer from '../footer/component';

const Layout = ({ children }) => (
  <>
    <div className="wrapper">
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  </>
);

export default Layout;

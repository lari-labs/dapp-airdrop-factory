import NavigationMenu from '../ bar/component';
import Footer from '../footer/component';

const Layout = ({ children }) => (
  <>
    <div className="wrapper">
      <main className="main-content font-poppins">{children}</main>
      <Footer />
    </div>
  </>
);

export default Layout;

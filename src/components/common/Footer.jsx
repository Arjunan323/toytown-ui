import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your trusted online toy store. Bringing joy to children with quality toys
              and exceptional service.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link href="/products" color="inherit" underline="hover">
                Products
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                About Us
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" underline="hover">
                Help Center
              </Link>
              <Link href="/shipping" color="inherit" underline="hover">
                Shipping Info
              </Link>
              <Link href="/returns" color="inherit" underline="hover">
                Returns Policy
              </Link>
              <Link href="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Social Media & Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2">
            © {currentYear} {import.meta.env.VITE_APP_NAME || "Aadhav's ToyTown"}. All rights
            reserved.
          </Typography>

          {/* Social Media Icons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener"
              color="inherit"
              aria-label="Facebook"
            >
              <Facebook />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener"
              color="inherit"
              aria-label="Twitter"
            >
              <Twitter />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener"
              color="inherit"
              aria-label="Instagram"
            >
              <Instagram />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              rel="noopener"
              color="inherit"
              aria-label="YouTube"
            >
              <YouTube />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;

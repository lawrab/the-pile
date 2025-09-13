{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    nodejs_20
    python311
    python311Packages.pip
    python311Packages.virtualenv
    
    # Use playwright-driver.browsers (recommended approach)
    playwright-driver.browsers
    chromium  # Keep system chromium as fallback
  ];

  shellHook = ''
    # NixOS Playwright setup (community recommended)
    export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
    export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
    
    # Fallback to system chromium if needed
    export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
    
    echo "🦀 NixOS Playwright environment loaded!"
    echo "Using playwright-driver.browsers: ${pkgs.playwright-driver.browsers}"
    echo "Fallback Chromium: ${pkgs.chromium}/bin/chromium" 
    echo "You can now run: ./run-tests.sh --e2e-chromium"
  '';
}
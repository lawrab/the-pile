{
  description = "The Pile development environment with Puppeteer MCP server";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Get the chromium executable path
        chromiumPath = "${pkgs.chromium}/bin/chromium";
        
        # MCP configuration for Puppeteer
        mcpConfig = {
          mcpServers = {
            puppeteer = {
              command = "npx";
              args = [ "@modelcontextprotocol/server-puppeteer" ];
              env = {
                PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
                PUPPETEER_EXECUTABLE_PATH = chromiumPath;
              };
            };
          };
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            chromium
            # Additional tools that might be useful
            nodePackages.npm
            git
          ];

          shellHook = ''
            # Set Puppeteer environment variables
            export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
            export PUPPETEER_EXECUTABLE_PATH="${chromiumPath}"
            
            # Create .mcp.json if it doesn't exist
            if [ ! -f .mcp.json ]; then
              echo "Creating .mcp.json configuration..."
              cat > .mcp.json << 'EOF'
            ${builtins.toJSON mcpConfig}
            EOF
              echo "✓ Created .mcp.json with Puppeteer MCP server configuration"
            else
              echo "✓ .mcp.json already exists"
            fi
            
            # Friendly welcome message
            echo ""
            echo "🚀 Welcome to The Pile development environment!"
            echo ""
            echo "📦 Available tools:"
            echo "  • Node.js $(node --version)"
            echo "  • npm $(npm --version)"
            echo "  • Chromium ${pkgs.chromium.version}"
            echo ""
            echo "🎭 Puppeteer MCP Server configured:"
            echo "  • PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true"
            echo "  • PUPPETEER_EXECUTABLE_PATH=${chromiumPath}"
            echo ""
            echo "💡 To test Puppeteer MCP:"
            echo "  npx @modelcontextprotocol/server-puppeteer"
            echo ""
            echo "🔧 The .mcp.json file is configured for Claude Code integration"
            echo ""
          '';

          # Additional environment setup
          NIX_SHELL_PRESERVE_PROMPT = 1;
        };

        # Optional: Add a check to verify the setup
        checks.puppeteer-test = pkgs.runCommand "puppeteer-test" {
          buildInputs = [ pkgs.nodejs_20 pkgs.chromium ];
        } ''
          export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
          export PUPPETEER_EXECUTABLE_PATH="${chromiumPath}"
          
          # Test that chromium exists and is executable
          if [ -x "${chromiumPath}" ]; then
            echo "✓ Chromium executable found at ${chromiumPath}"
            touch $out
          else
            echo "✗ Chromium executable not found or not executable"
            exit 1
          fi
        '';
      });
}
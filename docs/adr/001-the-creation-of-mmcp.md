# Creation of MMCP

## The Problem
Once upon a time there was an MCP server (Spring-based) managed by a team of developers that used it.
Every time they needed something, a new tool was added. The list grew.

This caused a couple of problems:
1. Baseline token consumption grew with each tool added to the list.
2. Changing what's available (e.g. to control whether agent has write access to system XYZ) required relaunching application (different startup params, maybe commenting something out)

## The Alternatives
Sure, they could split the giant MCP into a couple smaller ones, but that would require them to launch ~ a dozen of servers locally.
There also were some tools that touched on multiple parts of the MCP. Should the servers talk with each other after the split?
This could lead to self-hosting a local swarm of microservices.

## The Solution
As it turns out - ModelContextProtocol's TypeScript SDK makes it possible to expose multiple MCPs in a single executable, even listening on one port.

I decided to create a set of packages that would allow for easy creation of such a server, along with supporting client libraries.

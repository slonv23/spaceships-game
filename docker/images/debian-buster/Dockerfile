FROM gcc:8

# Install cmake
RUN wget https://github.com/Kitware/CMake/releases/download/v3.15.5/cmake-3.15.5-Linux-x86_64.sh \
		-q -O /tmp/cmake-install.sh \
		&& chmod u+x /tmp/cmake-install.sh \
		&& mkdir /usr/bin/cmake \
		&& /tmp/cmake-install.sh --skip-license --prefix=/usr/bin/cmake \
		&& rm /tmp/cmake-install.sh

ENV PATH="/usr/bin/cmake/bin:${PATH}"

# Build and install libnice from sources

RUN cd /tmp && git clone https://github.com/libnice/libnice.git \
	&& cd libnice \
	&& git checkout d4ef6b692fe7a18013fbb698d8fc7d0f2995ef8c
	
RUN apt-get update && apt-get -y install gtk-doc-tools

RUN cd /tmp/libnice	&& ./autogen.sh && ./configure && make && make install	

# Install boost (required by https://github.com/meltwater/served)

## gcc:8 image uses different version of gfortran (build from sources),
## commands below allow to avoid warnings during gfortran package installation which is dependency of boost
RUN dpkg-divert --remove /usr/bin/gfortran
RUN dpkg-divert --divert /usr/bin/gfortran.orig --rename /usr/local/bin/gfortran

RUN apt-get -y install libboost-all-dev

# Install packages required by VSCode
RUN apt-get -y install --no-install-recommends apt-utils dialog 2>&1 \
    # 
    # Verify git, process tools, lsb-release (useful for CLI installs) installed
    && apt-get -y install git iproute2 procps lsb-release \
    #
    # Install C++ tools
    && apt-get -y install build-essential cppcheck valgrind \
    #
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

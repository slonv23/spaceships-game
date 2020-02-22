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
